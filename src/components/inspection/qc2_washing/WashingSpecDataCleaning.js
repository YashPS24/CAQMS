export const cleanWashingSpecData = (data) => {
  console.log('=== DEBUGGING EXCEL DATA STRUCTURE ===');
  console.log('Total rows in data:', data.length);
  
  // Log first few rows to understand structure
  data.slice(0, 6).forEach((row, index) => {
    console.log(`Row ${index}:`, row);
  });

  if (!data || data.length < 5) {
    throw new Error("Insufficient data or wrong format.");
  }

  // Extract color information from row 2 (index 1)
  const colorRow = data[1];
  console.log('Color row:', colorRow);
  
  let colorInfo = null;
  let shrinkageInfo = null;
  
  if (colorRow && colorRow.length > 0) {
    // Extract color information
    const colorText = colorRow.find(cell => 
      cell && typeof cell === 'string' && (cell.includes('颜色') || cell.includes('COLOR'))
    );
    console.log('Found color text:', colorText);
    
    if (colorText) {
      // Try multiple patterns for color extraction
      let colorMatch = colorText.match(/颜色:\s*(\w+)\s+(\w+)/);
      if (!colorMatch) {
        colorMatch = colorText.match(/COLOR:\s*(\w+)\s+(\w+)/i);
      }
      if (!colorMatch) {
        colorMatch = colorText.match(/(\d+)\s+([A-Z\s]+)/);
      }
      
      if (colorMatch) {
        colorInfo = {
          colorCode: colorMatch[1], // "900"
          colorName: colorMatch[2]  // "BLACK"
        };
      }
    }

    // Extract shrinkage information from K2 cell (index 10)
    const shrinkageText = colorRow[10]; // K column is index 10
    console.log('Found shrinkage text:', shrinkageText);
    
    if (shrinkageText && typeof shrinkageText === 'string' && shrinkageText.includes('缩率')) {
      // Parse shrinkage data like "缩率：L-1% W:-6%"
      const shrinkageMatch = shrinkageText.match(/缩率[：:]\s*L([+-]?\d+(?:\.\d+)?)%\s*W[：:]?([+-]?\d+(?:\.\d+)?)%/);
      if (shrinkageMatch) {
        shrinkageInfo = {
          raw: shrinkageText,
          length: parseFloat(shrinkageMatch[1]), // L-1% -> -1
          width: parseFloat(shrinkageMatch[2])   // W:-6% -> -6
        };
      }
    }
  }
  
  console.log('Extracted color info:', colorInfo);
  console.log('Extracted shrinkage info:', shrinkageInfo);

  // Row 3 (index 2): Wash type indicators (客人尺寸, 洗前)
  // Row 4 (index 3): Size names (XS, S, M, L, XL, XXL)
  const washTypeRow = data[2];  // Wash type indicators
  const sizeHeaderRow = data[3]; // Size names
  
  console.log('=== HEADER ANALYSIS ===');
  console.log('Wash Type Row (index 2):', washTypeRow);
  console.log('Size Header Row (index 3):', sizeHeaderRow);
  
  const headers = [];
  const sizeGroups = {};

  // Process columns to find size headers and their wash types
  if (sizeHeaderRow && sizeHeaderRow.length > 0) {
    for (let i = 0; i < sizeHeaderRow.length; i++) {
      const sizeCell = sizeHeaderRow[i];
      const washTypeCell = washTypeRow ? washTypeRow[i] : null;
      
      console.log(`Column ${i}: Size="${sizeCell}", WashType="${washTypeCell}"`);
      
      if (sizeCell && typeof sizeCell === 'string' && sizeCell.trim() !== '') {
        const sizeName = cleanValue(sizeCell.trim());
        
        // Check if this looks like a standard size (XS, S, M, L, XL, XXL)
        if (sizeName.match(/^(XS|S|M|L|XL|XXL)$/i)) {
          console.log(`Found valid size: ${sizeName} at column ${i}`);
          
          // Initialize size group if not exists
          if (!sizeGroups[sizeName]) {
            sizeGroups[sizeName] = {
              size: sizeName,
              beforeWashColumn: null,
              afterWashColumn: null
            };
          }
          
          // Check wash type
          if (washTypeCell && typeof washTypeCell === 'string') {
            const washType = cleanValue(washTypeCell);
            if (washType.includes('洗前')) {
              // Before wash column
              sizeGroups[sizeName].beforeWashColumn = i;
              console.log(`Set before wash column for ${sizeName}: ${i}`);
            } else if (washType.includes('客人尺寸')) {
              // After wash column (Customer Size)
              sizeGroups[sizeName].afterWashColumn = i;
              console.log(`Set after wash column for ${sizeName}: ${i}`);
            }
          }
        } else {
          console.log(`Skipping non-standard size: ${sizeName}`);
        }
      }
    }
  }

  console.log('=== SIZE GROUPS FOUND ===');
  console.log('Size groups:', sizeGroups);

  // Convert size groups to headers array - only include sizes that have both before and after wash columns
  Object.values(sizeGroups).forEach(group => {
    if (group.beforeWashColumn !== null && group.afterWashColumn !== null) {
      headers.push(group);
      console.log(`Added complete size group: ${group.size}`);
    } else {
      console.log(`Skipping incomplete size group: ${group.size} (before: ${group.beforeWashColumn}, after: ${group.afterWashColumn})`);
    }
  });

  console.log('=== FINAL HEADERS ===');
  console.log('Headers:', headers);

  // Process data rows (starting from row 5, index 4)
  const dataRows = data.slice(4);
  console.log('=== DATA ROWS TO PROCESS ===');
  console.log('Data rows count:', dataRows.length);
  
  const cleanedRows = [];
  dataRows.forEach((row, rowIndex) => {
    console.log(`Processing data row ${rowIndex}:`, row);
    
    // Skip empty rows
    if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
      console.log(`Skipping empty row ${rowIndex}`);
      return;
    }

    // Extract description columns based on your structure:
    // A4: 序号, B4: 中文位置, C4: 英文备注, D4: Tol(-), E4: Tol(+)
    let 序号 = cleanValue(row[0]) || '';           // Column A
    let 中文描述 = cleanValue(row[1]) || '';        // Column B  
    let 英文描述 = cleanValue(row[2]) || '';        // Column C
    let tolMinus = cleanValue(row[3]) || '';       // Column D
    let tolPlus = cleanValue(row[4]) || '';        // Column E

    const rowData = {
      序号: 序号,
      中文描述: 中文描述,
      英文描述: 英文描述,
      Tol_Minus: processTolerance(tolMinus, 'minus'),
      Tol_Plus: processTolerance(tolPlus, 'plus'),
      specs: {}
    };

    console.log(`Row ${rowIndex} basic data:`, {
      序号: rowData.序号,
      中文描述: rowData.中文描述,
      英文描述: rowData.英文描述,
      Tol_Minus: rowData.Tol_Minus,
      Tol_Plus: rowData.Tol_Plus
    });

    // Process size specifications for both before and after wash
    headers.forEach(header => {
      rowData.specs[header.size] = {};
      
      // Before wash data
      if (header.beforeWashColumn !== null) {
        const beforeWashValue = cleanValue(row[header.beforeWashColumn]);
        if (beforeWashValue && beforeWashValue !== '') {
          rowData.specs[header.size].beforeWash = fractionToDecimal(beforeWashValue);
          console.log(`Before wash ${header.size}:`, beforeWashValue, '→', rowData.specs[header.size].beforeWash);
        }
      }
      
      // After wash data (Customer Size)
      if (header.afterWashColumn !== null) {
        const afterWashValue = cleanValue(row[header.afterWashColumn]);
        if (afterWashValue && afterWashValue !== '') {
          rowData.specs[header.size].afterWash = fractionToDecimal(afterWashValue);
          console.log(`After wash ${header.size}:`, afterWashValue, '→', rowData.specs[header.size].afterWash);
        }
      }
    });

    // Only add row if it has actual measurement data OR description
    const hasData = Object.keys(rowData.specs).some(size => 
      rowData.specs[size].beforeWash || rowData.specs[size].afterWash
    );
    const hasDescription = rowData.英文描述 || rowData.中文描述;

    console.log(`Row ${rowIndex} - Has data: ${hasData}, Has description: ${hasDescription}`);

    if ((hasData || hasDescription) && (rowData.英文描述 || rowData.中文描述)) {
      cleanedRows.push(rowData);
      console.log(`Added row ${rowIndex} to cleaned rows`);
    } else {
      console.log(`Skipped row ${rowIndex} - no data or description`);
    }
  });

  console.log('=== FINAL RESULTS ===');
  console.log('Cleaned rows count:', cleanedRows.length);
  console.log('Headers found:', headers.length);
  console.log('Sample cleaned row:', cleanedRows[0]);

  return {
    colorInfo,
    shrinkageInfo, // Add shrinkage info to return object
    headers: headers.map(h => ({ 
      size: h.size, 
      hasBeforeWash: h.beforeWashColumn !== null,
      hasAfterWash: h.afterWashColumn !== null
    })),
    rows: cleanedRows,
    sizeColumns: headers.map(h => h.size)
  };
};

// Rest of the helper functions remain the same...
const processTolerance = (value, type) => {
  if (!value || value === '') {
    return { raw: '', decimal: 0 };
  }

  let cleanedValue = cleanValue(value).replace(/^[+-]/, '');
  const result = fractionToDecimal(cleanedValue);
  
  if (result.decimal !== null) {
    if (type === 'minus') {
      result.decimal = -Math.abs(result.decimal);
      result.raw = '-' + cleanedValue;
    } else {
      result.decimal = Math.abs(result.decimal);
      result.raw = '+' + cleanedValue;
    }
  }
  
  return result;
};

const cleanValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  return String(value)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\u00A0\u2000-\u200B\u2028\u2029\u202F\u205F\u3000]/g, '')
    .trim();
};

const fractionToDecimal = (value) => {
  const originalValue = value;
  
  if (value === null || value === undefined || String(value).trim() === "") {
    return { raw: originalValue, decimal: null };
  }

  const cleanedValue = cleanValue(value);
  const strValue = cleanedValue
    .replace(/⁄/g, "/")
    .replace(/\s+/g, " ")
    .trim();
  
  if (!/^-?[\d\s\/\.]+$/.test(strValue)) {
    console.warn(`Non-numeric value encountered: "${originalValue}"`);
    return { raw: originalValue, decimal: null };
  }

  let total = 0;

  try {
    if (strValue.includes(" ") && strValue.includes("/")) {
      const parts = strValue.split(" ");
      const whole = parseFloat(parts[0]);
      const fractionParts = parts[1].split("/");
      const numerator = parseFloat(fractionParts[0]);
      const denominator = parseFloat(fractionParts[1]);
      
      if (isNaN(whole) || isNaN(numerator) || isNaN(denominator) || denominator === 0) {
        throw new Error("Invalid mixed fraction");
      }
      
      total = whole + (Math.sign(whole) || 1) * (numerator / denominator);
    } else if (strValue.includes("/")) {
      const fractionParts = strValue.split("/");
      const numerator = parseFloat(fractionParts[0]);
      const denominator = parseFloat(fractionParts[1]);
      
      if (isNaN(numerator) || isNaN(denominator) || denominator === 0) {
        throw new Error("Invalid simple fraction");
      }
      
      total = numerator / denominator;
    } else {
      total = parseFloat(strValue);
    }

    const decimal = isNaN(total) ? null : parseFloat(total.toFixed(4));
    return { raw: cleanedValue, decimal: decimal };

  } catch (e) {
    console.warn(`Could not parse fraction: "${originalValue}"`, e.message);
    return { raw: originalValue, decimal: null };
  }
};

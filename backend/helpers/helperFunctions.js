
// Helper function to map page identifiers to keywords in processName
export const getProcessKeywordForPage = (pageIdentifier) => {
  const keywordMap = {
    "bundle-registration": "bundle",
    washing: "washing",
    opa: "opa",
    ironing: "ironing",
    packing: "packing", // The keyword remains the same
    "qc2-inspection": "qc2"
  };
  return keywordMap[pageIdentifier.toLowerCase()];
};
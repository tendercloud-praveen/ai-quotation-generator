// import axiosInstance from "../api/axiosinstance";

// /**
//  * GET
//  * /quotation-approval/pending
//  */
// export const getPendingQuotationsApi = async () => {
//   const response = await axiosInstance.get("/quotation-approval/pending");

//   return response.data;
// };

// /**
//  * GET
//  * /quotation-approval/{quotation_id}
//  */
// export const getQuotationApprovalDetailsApi = async (quotationId) => {
//   const response = await axiosInstance.get(
//     `/quotation-approval/${quotationId}`,
//   );

//   return response.data;
// };

// /**
//  * POST
//  * /quotation-approval/{quotation_id}/approve
//  */
// export const approveQuotationApi = async (quotationId, comment = "") => {
//   const response = await axiosInstance.post(
//     `/quotation-approval/${quotationId}/approve`,
//     {
//       comment: String(comment || ""),
//     },
//     {
//       headers: {
//         "Content-Type": "application/json",
//       },
//     },
//   );

//   return response.data;
// };

// /**
//  * POST
//  * /quotation-approval/{quotation_id}/reject
//  */
// export const requestQuotationChangesApi = async (quotationId, comment = "") => {
//   const requestBody = {
//     comment: String(comment || ""),
//   };

//   console.log("REQUEST CHANGES:", quotationId, requestBody);

//   const response = await axiosInstance.post(
//     `/quotation-approval/${quotationId}/request-changes`,
//     requestBody,
//   );

//   return response.data;
// };
// // /**
// //  * POST
// //  * /quotation-approval/{quotation_id}/request-changes
// //  */
// // export const requestQuotationChangesApi = async (quotationId, data = {}) => {
// //   const response = await axiosInstance.post(
// //     `/quotation-approval/${quotationId}/request-changes`,
// //     data,
// //   );

// //   return response.data;
// // };

// /**
//  * PUT
//  * /quotation-approval/{quotation_id}/prices
//  */
// export const updateQuotationPricesApi = async (quotationId, items) => {
//   const response = await axiosInstance.put(
//     `/quotation-approval/${quotationId}/prices`,
//     {
//       items,
//     },
//   );

//   return response.data;
// };

// /**
//  * GET
//  * /quotation-approval/salesperson/my-quotations
//  */
// export const getMySalespersonQuotationsApi = async () => {
//   const response = await axiosInstance.get(
//     "/quotation-approval/salesperson/my-quotations",
//   );

//   return response.data;
// };

import axiosInstance from "../api/axiosinstance";

/**
 * GET
 * /quotation-approval/pending
 */
export const getPendingQuotationsApi = async () => {
  const response = await axiosInstance.get("/quotation-approval/pending");

  return response.data;
};

/**
 * GET
 * /quotation-approval/{quotation_id}
 */
export const getQuotationApprovalDetailsApi = async (quotationId) => {
  const response = await axiosInstance.get(
    `/quotation-approval/${quotationId}`,
  );

  return response.data;
};

/**
 * POST
 * /quotation-approval/{quotation_id}/approve
 *
 * Body:
 * {
 *   "comment": "string"
 * }
 */
export const approveQuotationApi = async (quotationId, comment = "") => {
  const response = await axiosInstance.post(
    `/quotation-approval/${quotationId}/approve`,
    {
      comment: String(comment || ""),
    },
  );

  return response.data;
};

/**
 * POST
 * /quotation-approval/{quotation_id}/reject
 *
 * Body:
 * {
 *   "reason": "string"
 * }
 */
export const rejectQuotationApi = async (quotationId, reason) => {
  const response = await axiosInstance.post(
    `/quotation-approval/${quotationId}/reject`,
    {
      reason: reason.trim(),
    },
  );

  return response.data;
};

/**
 * POST
 * /quotation-approval/{quotation_id}/request-changes
 *
 * Body:
 * {
 *   "comment": "string"
 * }
 */
export const requestQuotationChangesApi = async (quotationId, comment = "") => {
  const requestBody = {
    comment: String(comment || ""),
  };

  console.log("REQUEST CHANGES:", quotationId, requestBody);

  const response = await axiosInstance.post(
    `/quotation-approval/${quotationId}/request-changes`,
    requestBody,
  );

  return response.data;
};

/**
 * PUT
 * /quotation-approval/{quotation_id}/prices
 *
 * Body:
 * {
 *   "items": [
 *     {
 *       "quotation_item_id": 4,
 *       "selling_price": 500
 *     }
 *   ]
 * }
 */
export const updateQuotationPricesApi = async (quotationId, items) => {
  const response = await axiosInstance.put(
    `/quotation-approval/${quotationId}/prices`,
    {
      items,
    },
  );

  return response.data;
};

/**
 * GET
 * /quotation-approval/salesperson/my-quotations
 */
export const getMySalespersonQuotationsApi = async () => {
  const response = await axiosInstance.get(
    "/quotation-approval/salesperson/my-quotations",
  );

  return response.data;
};

export const getManagerQuotationStatusApi = async (status) => {
  const response = await axiosInstance.get(
    `/manager/quotation-status?status=${encodeURIComponent(status)}`,
  );

  return response.data;
};

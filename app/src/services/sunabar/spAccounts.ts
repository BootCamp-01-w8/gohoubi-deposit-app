import axios from "axios";

const sunabarToken = process.env.SUNABAR_TOKEN;


//depositSpAcId:振込先 debitSpAcId:出金元 paymentAmount:振替額
export const spAccountsTransfer = (
  depositSpAcId: any,
  debitSpAcId: any,
  paymentAmount: any
) =>
{
  console.log(depositSpAcId);
  console.log(debitSpAcId);
  console.log(paymentAmount);

  const data = {
    depositSpAccountId: depositSpAcId,
    debitSpAccountId: debitSpAcId,
    currencyCode: "JPY",
    paymentAmount: paymentAmount,
  };

  const config = {
    method: "post",
    url: "https://api.sunabar.gmo-aozora.com/personal/v1/transfer/spaccounts-transfer",
    headers: {
      Accept: "application/json;charset=UTF-8",
      "Content-Type": "application/json;charset=UTF-8",
      "x-access-token": sunabarToken,
    },
    data: data,
  };

  axios(config)
    .then(function (response) {
      console.log("res",response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
};

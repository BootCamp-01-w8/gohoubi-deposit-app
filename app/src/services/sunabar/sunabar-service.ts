import axios from "axios";

const sunabarToken = process.env.SUNABAR_TOKEN;

// 残高照会API呼び出し
export const balancesService = axios.create({
  baseURL: "https://api.sunabar.gmo-aozora.com/personal/v1/accounts/balances",
  responseType: "json",
  headers: {
    Accept: "application/json;charset=UTF-8",
    "Content-Type": "application/json;charset=UTF-8",
    "x-access-token": sunabarToken,
  },
});

// axios postman
// ごほうび口座へ振替APIのrequest_parameter
const depositSpAccountId = "SP50220329040";
const debitSpAccountId = "SP30210005951";

// 100円振替
const data100 = `{ \r\n\t"depositSpAccountId":${depositSpAccountId},\r\n\t"debitSpAccountId":${debitSpAccountId},\r\n\t"currencyCode":"JPY",\r\n\t"paymentAmount":"100"\r\n}`;

export const selfTransferService100 = axios.create({
  method: "post",
  url: "https://api.sunabar.gmo-aozora.com/personal/v1/transfer/spaccounts-transfer",
  headers: {
    Accept: "application/json;charset=UTF-8",
    "Content-Type": "application/json;charset=UTF-8",
    "x-access-token": sunabarToken,
  },
  data: data100,
});

// 1000円振替
const data1000 = `{ \r\n\t"depositSpAccountId":${depositSpAccountId},\r\n\t"debitSpAccountId":${debitSpAccountId},\r\n\t"currencyCode":"JPY",\r\n\t"paymentAmount":"500"\r\n}`;

export const selfTransferService1000 = axios.create({
  method: "post",
  url: "https://api.sunabar.gmo-aozora.com/personal/v1/transfer/spaccounts-transfer",
  headers: {
    Accept: "application/json;charset=UTF-8",
    "Content-Type": "application/json;charset=UTF-8",
    "x-access-token": sunabarToken,
  },
  data: data1000,
});

// lambda テスト用
// const transferOptions = {
//   method: "POST",
//   url: "https://api.sunabar.gmo-aozora.com/personal/v1/transfer/spaccounts-transfer",
//   headers: {
//     Accept: "application/json;charset=UTF-8",
//     "Content-Type": "application/json;charset=UTF-8",
//     "x-access-token": sunabarToken,
//   },
//   body: `{ \r\n	"depositSpAccountId":${depositSpAccountId},\r\n	"debitSpAccountId":${debitSpAccountId},\r\n	"currencyCode":"JPY",\r\n	"paymentAmount":"${amount}"\r\n}`,
// };

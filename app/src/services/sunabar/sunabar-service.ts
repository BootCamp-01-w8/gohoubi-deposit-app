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
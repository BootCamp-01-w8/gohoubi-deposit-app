import axios from "axios";
import { balancesService } from "@src/services/sunabar/sunabar-service";

const sunabarToken = process.env.SUNABAR_TOKEN;

// lambda用　ごほうび口座へ振替APIのrequest_parameter
let amount = 0;
const depositSpAccountId = "SP50220329040";
const debitSpAccountId = "SP30210005951";

// axios postman
const data = `{ \r\n\t"depositSpAccountId":${depositSpAccountId},\r\n\t"debitSpAccountId":${debitSpAccountId},\r\n\t"currencyCode":"JPY",\r\n\t"paymentAmount":"${amount}"\r\n}`;

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

export const selfTransfer = axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));

    const resPaymentAmount = JSON.parse(response.body).paymentAmount;
    const balances = await balancesService.get("/");
    const rootBalance = balances.data.spAccountBalances[0].odBalance; //親口座残高
    const childBalance = balances.data.spAccountBalances[1].odBalance; //子口座残高

    return client.replyMessage(event.replyToken, [
      {
        type: "text",
        text: `おつかれさま！${resPaymentAmount}円をごほうび貯金したよ！`, // 振替金額
      },
      {
        type: "text",
        text: `残高は、親口座：${rootBalance}円、ごほうび口座：${childBalance}円だよ。ゆっくり休んでね`,
      },
    ]);
    
  })
  .catch(function (error) {
    console.log(error);
  });

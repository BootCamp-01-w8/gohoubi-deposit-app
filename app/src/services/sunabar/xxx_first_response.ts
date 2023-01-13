"use strict";

const line = require("@line/bot-sdk");
const request = require("request");

const config = {
  channelSecret: process.env.channelSecretLINE,
  channelAccessToken: process.env.channelAccessTokenLINE,
};

const client = new line.Client(config);
const sunabarToken = process.env.sunabarToken;

exports.handler = (event) => {
  console.log(event);

  const replyToken = JSON.parse(event.body).events[0].replyToken;

  let reqMessage = JSON.parse(event.body).events[0].message.text;
  let resMessage = "";
  let balance = 0; //残高の初期値

  const request = require("request");

  // 残高照会APIのrequest_parameter
  const balanceOptions = {
    method: "GET",
    url: "https://api.sunabar.gmo-aozora.com/personal/v1/accounts/balances",
    headers: {
      Accept: "application/json;charset=UTF-8",
      "Content-Type": "application/json;charset=UTF-8",
      "x-access-token": "YWQ4NmYwYjAxMTQxZWFmYzg3YTcxMzU0",
    },
  };

  // ごほうび口座へ振替APIのrequest_parameter
  let amount = 0;
  if (reqMessage == "つかれた") {
    amount = 100;
  } else if (reqMessage == "つらい") {
    amount = 500;
  }
  const transferOptions = {
    method: "POST",
    url: "https://api.sunabar.gmo-aozora.com/personal/v1/transfer/spaccounts-transfer",
    headers: {
      Accept: "application/json;charset=UTF-8",
      "Content-Type": "application/json;charset=UTF-8",
      "x-access-token": "YWQ4NmYwYjAxMTQxZWFmYzg3YTcxMzU0",
    },
    body: `{ \r\n	"depositSpAccountId":"SP50220329040",\r\n	"debitSpAccountId":"SP30210005951",\r\n	"currencyCode":"JPY",\r\n	"paymentAmount":"${amount}"\r\n}`,
  };

  // つかれたwordが含まれていたら
  if (reqMessage == "つかれた" || reqMessage == "つらい") {
    console.log("LINEに応答"); // lambda log

    // 残高照会API呼び出し
    request(balanceOptions, function (error, response) {
      const resMessage = response.body; //test
      const resBalance = JSON.parse(response.body).balances[0].balance;
      const rootBalance = JSON.parse(response.body).spAccountBalances[0]
        .odBalance; //親口座残高
      const childBalance = JSON.parse(response.body).spAccountBalances[1]
        .odBalance; //ごほうび口座残高

      balance = resBalance;
      if (error) throw new Error(error);
      console.log(resMessage); // lambda log

      // 残高に応じて振替
      if (reqMessage == "つかれた" && rootBalance >= 100) {
        // ごほうび口座へ振替API呼び出し
        let resPaymentAmount = amount;
        request(transferOptions, function (error, response) {
          if (error) throw new Error(error);
          console.log(response.body); // lambda log
          resPaymentAmount = JSON.parse(response.body).paymentAmount;
        });
        return client.replyMessage(replyToken, [
          {
            type: "text",
            text: `おつかれさま！${resPaymentAmount}円をごほうび貯金したよ！`, // 振替金額
          },
          {
            type: "text",
            text: `残高は、親口座：${rootBalance}円、ごほうび口座：${childBalance}円だよ。ゆっくり休んでね`,
          },
        ]);
      } else if (reqMessage == "つらい" && rootBalance >= 500) {
        // ごほうび口座へ振替API呼び出し
        let resPaymentAmount = amount;
        request(transferOptions, function (error, response) {
          if (error) throw new Error(error);
          console.log(response.body); // lambda log
          resPaymentAmount = JSON.parse(response.body).paymentAmount;
        });
        return client.replyMessage(replyToken, [
          {
            type: "text",
            text: `おつかれさま！${resPaymentAmount}円をごほうび貯金したよ！`, // 振替金額
          },
          {
            type: "text",
            text: `残高は、親口座：${rootBalance}円、ごほうび口座：${childBalance}円だよ。ゆっくり休んでね`,
          },
        ]);
      } else if (childBalance >= 5000) {
        // 使うAPI呼び出し
        return client.replyMessage(replyToken, [
          {
            type: "text",
            text: `残高は、親口座：${rootBalance}円、ごほうび口座：${childBalance}円だよ。そろそろご褒美する？`,
          },
          { type: "text", text: "API呼び出し" },
        ]);
      } else {
        // 残高不足
        return client.replyMessage(replyToken, [
          {
            type: "text",
            text: "おつかれさま！残高不足で、ごほうび貯金できなかったよ",
          },
          {
            type: "text",
            text: `残高は、親口座：${rootBalance}円、ごほうび口座：${childBalance}円だよ。ゆっくり休んでね`,
          },
        ]);
      }
    });
  }
};

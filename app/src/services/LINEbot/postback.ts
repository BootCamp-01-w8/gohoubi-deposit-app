import { Router } from "express";
import * as line from "@line/bot-sdk";

import { PostbackEvent } from '@line/bot-sdk';
import { suggestUsage } from "@src/services/LINEbot/suggestUsage";
import { balancesService } from "@src/services/sunabar/sunabar-service";
import { spAccountsTransfer } from "@src/services/sunabar/spAccounts";
import { endOfWeek } from "date-fns";

const WebhookRouter = Router();

const config: any = {
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const client = new line.Client(config);

export const postback = async (event: PostbackEvent) => {
    if (event.postback.data === "useDeposit") {
        return suggestUsage(event);
    } else if (event.postback.data === "shopping") {
        /* 楽天検索　ご褒美口座の残高によって価格帯をセット。*/
        const balance = await balancesService.get("/");
        const max = balance.data.spAccountBalances[1].odBalance;
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: `https://search.rakuten.co.jp/search/mall/%E3%82%AE%E3%83%95%E3%83%88+%E5%A5%B3%E6%80%A7/?max=${max}&min=${max*0.8}&nitem=ふるさと納税`,
        });
    } else if (event.postback.data === "eat") {
        /* 食べログ　現在地から周辺５㎞の食べログ検索結果が出したい。*/
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: "https://tabelog.com/",
        });
    } else if (event.postback.data === "travel") {
        /* じゃらん 今週末から1泊２日で別府温泉の宿の検索結果。エリアコードをランダムに選んでセット出来たら楽しいかも。*/
        const today = endOfWeek(new Date());;
        const stayYear = today.getFullYear();
        const stayMonth = today.getMonth()+1;
        const stayDay = today.getDate();
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: `https://www.jalan.net/440000/LRG_440500/?stayYear=${stayYear}&stayMonth=${stayMonth}&stayDay=${stayDay}&stayCount=1&roomCount=1&adultNum=1&ypFlg=1&kenCd=440000&screenId=UWW1380&roomCrack=200000&lrgCd=440500&distCd=01&rootCd=04`,
        });
    } else if (event.postback.data === "transfer") {
        /* 振込 */
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: "振込先と金額を教えてね。", 
        });
    } else if (event.postback.data === "振替") {
        /* 残高照会 */
        const response = await balancesService.get("/");
        const childBalance = response.data.spAccountBalances[1].odBalance;

        /* 残高を親口座に振替*/
        const childSpAcId = process.env.CHILD_SP_AC_ID;
        const parentSpAcId = process.env.PARENT_SP_AC_ID;
        spAccountsTransfer(parentSpAcId, childSpAcId, childBalance);

        let resMessage = `親口座に${Number(childBalance).toLocaleString()}円振替したよ！`;
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: resMessage,
        });
    }
}

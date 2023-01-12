import { Router } from "express";
import * as line from "@line/bot-sdk";

import { PostbackEvent } from '@line/bot-sdk';
import { suggestUsage } from "@src/services/LINEbot/suggestUsage";
import { balancesService } from "@src/services/sunabar/sunabar-service";
import { spAccountsTransfer } from "@src/services/sunabar/spAccounts";

const WebhookRouter = Router();

const config: any = {
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const client = new line.Client(config);

export const postback = async(event: PostbackEvent) =>
{

    if (event.postback.data === "useDeposit")
    {
        return suggestUsage(event);
    } else if (event.postback.data === "shopping")
    {
        // 楽天
        console.log("楽天");
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: "楽天",
        });
    } else if (event.postback.data === "eat")
    {
        // 食べログ
        console.log("食べログ");
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: "食べログ",
        });
    } else if (event.postback.data === "travel")
    {
        // じゃらん
        console.log("じゃらん");
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: "じゃらん",
        });
    } else if (event.postback.data === "transfer")
    {
        // 振込
        console.log("振込");
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: "振込",
        });
    } else if (event.postback.data === "振替")
    {
        /* 残高照会 */
        const response = await balancesService.get("/");
        const childBalance = response.data.spAccountBalances[1].odBalance;

        /* 残高を親口座に振替*/
        const childSpAcId = "SP50220329019";
        const parentSpAcId = "SP30110005951";
        spAccountsTransfer(parentSpAcId, childSpAcId, childBalance);

        let resMessage = `親口座に${Number(childBalance).toLocaleString()}円振替したよ！`;
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: resMessage,
        });
    }
}

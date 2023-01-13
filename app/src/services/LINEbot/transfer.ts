import * as line from "@line/bot-sdk";
import { WebhookEvent } from "@line/bot-sdk";

import { transferService } from "@src/services/sunabar/sunabar-transfer";
import { spAccountsTransfer } from "@src/services/sunabar/spAccounts";
import { balancesService } from "@src/services/sunabar/sunabar-service";
import { response } from "express";

const config: any = {
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};
const client = new line.Client(config);

export const transfer = async (event: any) => {
    const message = event.message.text;
    /* text整形 */
    /* 支店番号 */
    let strMatch: any = message.match(/\d{3}-?\d{7}/);
    const beneficiaryBranchCode = strMatch[0].slice(0, 3);
    /* 口座番号 */
    const accountNumber = strMatch[0].slice(4);
    /* 振込額 */
    const sliceText = message.replace(/\d{3}-?\d{7}/, "");
    strMatch = sliceText.match(/[0-9]+/);
    const transferAmount = strMatch[0];

    /* 残高照会 */
    const balance = await balancesService.get("/");
    const childBalance = balance.data.spAccountBalances[1].odBalance;
    console.log("ご褒美", childBalance);
    console.log("振込", transferAmount);

    let resMessage = "";
    /* 振込額 < 残高 判定 */
    if (Number(transferAmount) < Number(childBalance)) {
        transferService(
            beneficiaryBranchCode,
            accountNumber,
            transferAmount
        )

        /* 振込額を親口座に振替 */
        const childSpAcId = process.env.SUNABAR_CHILD_ACCOUNT_ID;
        const parentSpAcId = process.env.SUNABAR_PARENT_ACCOUNT_ID;
        spAccountsTransfer(parentSpAcId, childSpAcId, transferAmount);

        return client.replyMessage(event.replyToken, {
            type: "text",
            text: resMessage,
        });
    } else {
        resMessage = "ざんねん！残高不足だよ";
        return client.replyMessage(event.replyToken, {
            type: "text",
            text: resMessage,
        });
    }
}

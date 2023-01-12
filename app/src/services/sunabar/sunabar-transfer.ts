import axios from "axios";

const sunabarToken = process.env.SUNABAR_TOKEN;

export const transferService = async (str: any) => {
  //支店番号抽出
  const beneficiaryBranchCode = str.match(/\d{3}-?\d{7}/)[0].slice(0, 3);
  //支店番号抽出
  const accountNumber = str.match(/\d{3}-?\d{7}/)[0].slice(4);
  //振込額抽出
  const sliceText = str.replace(/\d{3}-?\d{7}/, "");
  const transferAmount = sliceText.match(/[0-9]+/)[0];
  //確認
  console.log("支店番号", beneficiaryBranchCode);
  console.log("口座番号", accountNumber);
  console.log("transferAmount", transferAmount);

  //振込日セット
  const dt = new Date(Date.now() + 3600000 * 9);
  let dateTime = dt.toISOString(); // 2021-10-11T21:00:23.653Z
  dateTime = dateTime.replace("T", " ").replace(/\.\d{1,3}Z$/, "");

  console.log(dateTime);
  const currentDate = dateTime.slice(0, 10);
  console.log(currentDate);

  //振込依頼
  const data = {
    accountId: "301010005951",
    transferDesignatedDate: currentDate,
    transferDateHolidayCode: "1",
    totalCount: "1",
    totalAmount: transferAmount,
    transfers: [
      {
        itemId: "1",
        transferAmount: transferAmount,
        beneficiaryBankCode: "0310",
        beneficiaryBranchCode: beneficiaryBranchCode,
        accountTypeCode: "1",
        accountNumber: accountNumber,
        beneficiaryName: "ｽﾅﾊﾞ ﾂﾈｵ",
      },
    ],
  };
  const config = {
    method: "post",
    url: "https://api.sunabar.gmo-aozora.com/personal/v1/transfer/request",
    headers: {
      Accept: "application/json;charset=UTF-8",
      "Content-Type": "application/json;charset=UTF-8",
      "x-access-token": sunabarToken,
    },
    data: data,
  };

  const url = "https://bank.sunabar.gmo-aozora.com/bank/notices/important";

  const resMessage = await axios(config)
    .then((res) =>
    {
      return `振込受付完了!\n受付番号:${res.data.applyNo}\nパスワード入力してね\n` +
        url
    })
    .catch(function (error) {
      console.log("error", error);
      return '振込依頼情報に誤りがあるようです'
    });
  
  console.log("resMessage",resMessage);
  return resMessage;
};



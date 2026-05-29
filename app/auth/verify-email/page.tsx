import Link from "next/link";
import Image from "next/image";

export default function VerifyEmailPage() {
  return (
    <div className="bg-[#eff9f5] flex flex-col flex-1 items-center justify-center px-4">
      <div className="bg-white border border-[rgba(58,126,105,0.1)] shadow-[0px_1px_1px_rgba(0,0,0,0.05)] rounded-[12px] p-[33px] w-full max-w-[420px] flex flex-col items-center gap-6 text-center">
        <Image src="/logo.svg" alt="tocotoco logo" width={147} height={28} priority />

        <div className="flex flex-col gap-3">
          <h1 className="text-[#334155] text-[20px] font-bold">
            確認メールを送信しました
          </h1>
          <p className="text-[#475569] text-[14px] leading-relaxed">
            ご登録のメールアドレスに確認メールを送りました。<br />
            メール内のリンクをクリックして登録を完了してください。
          </p>
        </div>

        <div className="bg-[#f0faf6] rounded-[8px] px-5 py-4 w-full text-left text-[13px] text-[#3a7e69] leading-relaxed">
          メールが届かない場合は迷惑メールフォルダをご確認ください。
        </div>

        <Link
          href="/auth/login"
          className="text-[#3a7e69] text-[14px] font-bold underline"
        >
          ログインページへ
        </Link>
      </div>
    </div>
  );
}

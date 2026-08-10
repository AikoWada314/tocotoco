"use client";

import Modal from "react-modal";
import { CloseIcon } from "./icons/CloseIcon";
import { BellIcon } from "./icons/BellIcon";
import { useApiSWR } from "../_hooks/useApiSWR";
import { MyNotificationsResponse } from "@/app/api/me/notifications/route";
import { useSupabaseSession } from "../_hooks/useSupabaseSession";

type NotificationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

Modal.setAppElement("body");

export const NotificationModal = ({
  isOpen,
  onClose,
}: NotificationModalProps) => {
  const { data, mutate } = useApiSWR<MyNotificationsResponse>(
    isOpen ? "/api/me/notifications" : null,
  );
  const notifications = data?.notifications ?? [];
  const { token } = useSupabaseSession();

  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/me/notifications/${id}`, {
        method: "PATCH",
        headers: { Authorization: token ?? "" },
      });
      if (!res.ok) throw new Error("既読処理に失敗しました");
      mutate(); // 一覧を取り直して isRead を反映（未読ハイライトが消える）
    } catch (error) {
      console.error("通知の更新に失敗", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white w-full max-w-sm mt-16 mx-4 rounded-[12px] shadow-lg overflow-hidden outline-none"
      overlayClassName="fixed inset-0 bg-black/40 z-50 flex justify-end items-start"
    >
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#f1f5f9]">
        <p className="text-[#334155] text-[16px] font-bold">通知</p>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <CloseIcon />
        </button>
      </div>

      {/* 通知リスト */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          // 0件のときだけ中央寄せ＋🔔
          <div className="flex flex-col items-center justify-center py-12 text-[#94a3b8] text-sm gap-2">
            <BellIcon />
            <p>通知はありません</p>
          </div>
        ) : (
          // 1件以上：一覧（未読は薄い緑背景で強調）
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.isRead) markAsRead(n.id);
              }}
              className={`w-full cursor-pointer px-5 py-4 border-b border-[#f1f5f9] ${
                n.isRead ? "" : "bg-[#eff9f5]"
              }`}
            >
              <p className="text-[13px] font-bold text-[#334155]">
                {n.notification.title}
              </p>
              <p className="mt-0.5 text-[14px] text-[#334155]">
                {n.notification.content}
              </p>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

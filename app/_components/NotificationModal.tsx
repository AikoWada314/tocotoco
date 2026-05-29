"use client"

import Modal from 'react-modal'
import { CloseIcon } from './icons/CloseIcon'
import { BellIcon } from './icons/BellIcon'

type Props = {
  isOpen: boolean
  onClose: () => void
}

Modal.setAppElement('body')

export const NotificationModal = ({ isOpen, onClose }: Props) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="bg-white w-full max-w-sm mt-16 mr-4 rounded-[12px] shadow-lg overflow-hidden outline-none"
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
        <div className="flex flex-col items-center justify-center py-12 text-[#94a3b8] text-sm gap-2">
          <BellIcon />
          <p>通知はありません</p>
        </div>
      </div>
    </Modal>
  )
}

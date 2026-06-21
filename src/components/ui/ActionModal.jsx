import { useState } from "react";

const ActionModal = ({
  open,
  title,
  name,
  description,
  confirmText,
  action,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel
}) => {
  if (!open) return null;


  const [confirmName,setConfirmName]=useState(null)

  console.log(name)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-md border border-stone-300 bg-white p-5 shadow-xl">
        <h3 className="text-2xl font-semibold">{title}</h3>
        <p className="mt-2 text-stone-600">{description}</p>
       {confirmLabel === "Delete" && <p className="mt-2 text-stone-600 font-bold">{confirmText}</p>}
      {confirmLabel === "Delete" &&  <input type="text" className="w-full h-10 bg-gray-100 border-2 border-gray-200 focus:outline-none" onChange={(e)=>setConfirmName(e.target.value)} />}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            className="border border-stone-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.08em]"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          {confirmLabel === "Delete" ? <button
            type="button"
            disabled={name !== confirmName}
            className={`border ${name !== confirmName ? "border-black/10 bg-black/20" : "border-black bg-black" }  px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button> : 
          <button
            type="button"
            className="border border-black bg-black  px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-white"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          }
        </div>
      </div>
    </div>
  );
};

export default ActionModal;

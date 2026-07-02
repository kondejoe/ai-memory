{aiMessage && (
  <div className="mt-3 bg-gray-800 rounded-xl p-3">
    <p className="text-sm text-white">{aiMessage}</p>
    <div className="flex gap-3 mt-2">
      <button onClick={() => navigator.clipboard.writeText(aiMessage)}
        className="text-xs text-indigo-400">Copy</button>
      <a
        href={`https://wa.me/${customer.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(aiMessage)}`}
        target="_blank"
        className="text-xs text-green-400">
        Send via WhatsApp
      </a>
    </div>
  </div>
)}
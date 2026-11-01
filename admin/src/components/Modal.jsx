import { useEffect } from 'react'

export default function Modal({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div 
      className="fixed inset-0 z-50 bg-cocoa/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className={`bg-white border border-edge rounded-3xl shadow-xl w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} overflow-hidden transform transition-all flex flex-col max-h-[90vh]`}
        role="dialog" 
        aria-modal="true" 
        aria-label={title}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-edge">
          <h2 className="text-xl font-bold text-cocoa">{title}</h2>
          <button 
            type="button" 
            className="w-8 h-8 flex items-center justify-center rounded-full text-cocoa/70 hover:bg-sand hover:text-cocoa transition-all text-lg font-bold"
            onClick={onClose} 
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto text-cocoa">
          {children}
        </div>
      </div>
    </div>
  )
}
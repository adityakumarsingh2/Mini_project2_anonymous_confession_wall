import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Toast({ toasts, remove }) {
    return createPortal(
        <div className="toast-wrap">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} remove={remove} />
            ))}
        </div>,
        document.body
    );
}

function ToastItem({ toast, remove }) {
    useEffect(() => {
        const timer = setTimeout(() => remove(toast.id), 3200);
        return () => clearTimeout(timer);
    }, [toast.id, remove]);

    const icon = toast.type === 'success' ? '✅' : '❌';
    return (
        <div className={`toast ${toast.type}`}>
            <span>{icon}</span>
            <span>{toast.message}</span>
        </div>
    );
}

interface AlertDialogProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function AlertDialog({ children, onClose }: AlertDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white p-6 rounded-lg shadow-lg">
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {children}
        </button>
      </div>
    </div>
  );
}

export function AlertDialogAction(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} />;
}
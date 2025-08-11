export default function PortfolioNotes() {
  return (
    <div className="bg-zinc-800 p-6 rounded-xl text-white h-60">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-medium text-zinc-300">Notes</h2>
        <button className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1 text-sm rounded">
          + Add Note
        </button>
      </div>
      <p className="text-zinc-500 text-sm mt-4">No notes yet.</p>
    </div>
  );
}
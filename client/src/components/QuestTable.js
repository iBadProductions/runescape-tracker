
export default function QuestTable({ quests }) {
  return (
    <div className="w-full max-w-2xl mt-6">
      <h2 className="text-xl mb-2">Quest Progress</h2>
      <table className="w-full table-auto bg-gray-100 dark:bg-gray-800 rounded">
        <thead>
          <tr className="bg-gray-300 dark:bg-gray-700">
            <th className="p-2 text-left">Quest</th>
            <th className="p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {quests.map((q, i) => (
            <tr key={i} className="border-t border-gray-600">
              <td className="p-2">{q.name}</td>
              <td className="p-2">{q.completed ? "✅" : "❌"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


import { PieChart, Pie, Cell } from "recharts";

const COLORS = ["#0088FE"];

export default function BankChart({ value }) {
  return (
    <div className="mt-6 w-full max-w-2xl flex flex-col items-center">
      <h2 className="text-xl mb-2">Total Bank Value</h2>
      <PieChart width={250} height={250}>
        <Pie
          data={[{ name: "Bank Value", value }]}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          label
        >
          <Cell key={`cell-0`} fill={COLORS[0]} />
        </Pie>
      </PieChart>
      <p className="mt-2 text-lg">{value.toLocaleString()} GP</p>
    </div>
  );
}

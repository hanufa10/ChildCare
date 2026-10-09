
import { useMemo } from "react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

function RegistrationChart({ children = [] }) {
    const data = useMemo(() => {
        const today = new Date();

        // Include the current month and previous six months.
        const months = Array.from({ length: 7 }, (_, index) => {
            const date = new Date(
                today.getFullYear(),
                today.getMonth() - 6 + index,
                1
            );

            return {
                year: date.getFullYear(),
                month: date.getMonth(),
                name: date.toLocaleDateString("en-US", {
                    month: "short",
                }),
                registrations: 0,
            };
        });

        children.forEach((child) => {
            const registrationDate =
                child.createdDate ??
                child.CreatedDate ??
                child.registrationDate ??
                child.createdAt;

            if (!registrationDate) return;

            const date = new Date(registrationDate);

            if (Number.isNaN(date.getTime())) return;

            const month = months.find(
                (item) =>
                    item.year === date.getFullYear() &&
                    item.month === date.getMonth()
            );

            if (month) {
                month.registrations++;
            }
        });

        return months;
    }, [children]);

    return (
        <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 20,
                        left: -15,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f0e4ec"
                        vertical={false}
                    />

                    <XAxis
                        dataKey="name"
                        tick={{ fill: "#8c7d8e", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <YAxis
                        allowDecimals={false}
                        domain={[0, "auto"]}
                        tick={{ fill: "#8c7d8e", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />

                    <Tooltip
                        contentStyle={{
                            borderRadius: 10,
                            border: "1px solid #f1dce8",
                            fontSize: 13,
                        }}
                        formatter={(value) => [
                            value,
                            "Registrations",
                        ]}
                    />

                    <Line
                        type="monotone"
                        dataKey="registrations"
                        name="Registrations"
                        stroke="#D96C9D"
                        strokeWidth={3}
                        dot={{
                            r: 4,
                            fill: "#D96C9D",
                            strokeWidth: 2,
                            stroke: "#fff",
                        }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export default RegistrationChart;

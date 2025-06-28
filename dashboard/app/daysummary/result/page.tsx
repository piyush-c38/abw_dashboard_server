"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CalendarClock } from 'lucide-react';

export default function Result() {
    const [data, setData] = useState<any[]>([]);
    const searchParams = useSearchParams();
    const date = searchParams.get("date"); // expects YYYY-MM-DD

    const fetchData = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/day-summary", {
                params: { date }
            });
            // Sort by table_id (machine id) in increasing order
            const sorted = [...res.data].sort((a, b) => {
                // If table_id is numeric, sort numerically, else lexicographically
                const aId = isNaN(Number(a.table_id)) ? a.table_id : Number(a.table_id);
                const bId = isNaN(Number(b.table_id)) ? b.table_id : Number(b.table_id);
                if (aId < bId) return -1;
                if (aId > bId) return 1;
                return 0;
            });
            setData(sorted);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    useEffect(() => {
        if (date) {
            fetchData();
            const interval = setInterval(fetchData, 1000); // refresh every 1 sec
            return () => clearInterval(interval);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date]);

    return (
        <div className="flex flex-col w-screen h-screen justify-start items-center pt-40 gap-10 bg-[#effbfc] border-8 border-[#153c49]">
            <div>
                <h2 className="flex gap-2 text-4xl text-[#153c49] font-semibold text-center"><CalendarClock size={38} /> {date}</h2>
            </div>
            <div className="bg-gray-50 w-2/3 p-4 rounded-sm shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px] text-center py-4">Machine ID</TableHead>
                            <TableHead className="text-center">Job ID</TableHead>
                            <TableHead className="text-center">Process ID</TableHead>
                            <TableHead className="text-center">Product Count</TableHead>
                            <TableHead className="text-center">Job Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row: any) => (
                            <TableRow key={row.id} >
                                <TableCell className="text-center py-4">{row.table_id}</TableCell>
                                <TableCell className="text-center py-4">{row.job_id}</TableCell>
                                <TableCell className="text-center py-4">{row.process_id}</TableCell>
                                <TableCell className="text-center py-4">{row.count}</TableCell>
                                <TableCell
                                    className={`text-center py-4 ${row.job_status == 0 ? "text-green-600" : "text-red-600" }`}
                                >
                                    {row.job_status == 1 ? "Incomplete" : "Completed"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
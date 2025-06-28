"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CalendarClock, ClockFading } from 'lucide-react';

export default function TodayJob() {
    const [data, setData] = useState([]);
    const [machineStatus, setMachineStatus] = useState<Record<string, string>>({});
    const [currentTime, setCurrentTime] = useState(new Date());

    // Fetch latest job/process data
    const fetchData = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/latest-per-table");
            setData(res.data);
            console.log(res.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        }
    };

    // Fetch machine status (ON/OFF)
    const fetchMachineStatus = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/machine-status");
            // Convert array to object: { [table_id]: status }
            const statusMap: Record<string, string> = {};
            res.data.forEach((row: { table_id: string; status: string }) => {
                statusMap[row.table_id] = row.status;
            });
            setMachineStatus(statusMap);
        } catch (err) {
            console.error("Error fetching machine status:", err);
        }
    };

    useEffect(() => {
        fetchData();
        fetchMachineStatus();
        const interval = setInterval(() => {
            fetchData();
            fetchMachineStatus();
        }, 1000); // refresh every 1 sec
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col w-screen h-screen justify-start items-center pt-40 gap-10 bg-[#effbfc] border-8 border-[#153c49]">
            <div className="fixed top-0 left-0 w-full z-50 flex justify-center">
                <h2 className="text-4xl bg-[#153c49] text-white shadow-md flex gap-2 pt-2 pb-3 px-6 rounded-b-2xl justify-center items-center">
                    <CalendarClock size={38} />
                    {currentTime.toLocaleString()}
                    <ClockFading size={38} />
                </h2>
            </div>
            <div className="">
                <h2 className="text-4xl text-[#153c49] font-semibold text-center">Today's Job Status</h2>
            </div>
            <div className="bg-gray-50 w-2/3 p-4 rounded-sm shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px] text-center py-4">Table ID</TableHead>
                            <TableHead className="text-center">Current Job</TableHead>
                            <TableHead className="text-center">Current Process</TableHead>
                            <TableHead className="text-center">Product Count</TableHead>
                            <TableHead className="text-center">Total Product Weight</TableHead>
                            <TableHead className="text-center">Job Status</TableHead>
                            <TableHead className="text-center">Machine Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row: any) => (
                            <TableRow key={row.id} >
                                <TableCell className="text-center py-4">{row.table_id}</TableCell>
                                <TableCell className="text-center py-4">{row.job_id}</TableCell>
                                <TableCell className="text-center py-4">{row.process_id}</TableCell>
                                <TableCell className="text-center py-4">{row.count}</TableCell>
                                <TableCell className="text-center py-4">{row.weight}</TableCell>
                                <TableCell
                                    className={`text-center py-4 ${row.job_status == 1 ? "text-green-600" : "text-red-600"}`}
                                >
                                    {row.job_status == 1 ? "Running" : "Completed"}
                                </TableCell>
                                <TableCell className={`text-center py-4 ${machineStatus[row.table_id] === "ON" ? "text-green-600" : "text-red-600"}`}>
                                    {machineStatus[row.table_id] === "ON" ? "Connected" : "Disconnected"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
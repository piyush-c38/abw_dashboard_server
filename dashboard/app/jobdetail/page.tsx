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
} from "@/components/ui/table"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { useIsClient } from "@/lib/useIsClient";

interface WeightData {
    [jobId: string]: {
        [processId: string]: number;
    };
}

interface WeightEntry {
    jobId: string;
    processId: string;
    weight: number;
}

export default function JobDetail() {
    const [weights, setWeights] = useState<WeightData>({});
    const [isEditing, setIsEditing] = useState<{[key: string]: boolean}>({});
    const [editValues, setEditValues] = useState<{[key: string]: number}>({});
    const [newEntry, setNewEntry] = useState({ jobId: '', processId: '', weight: '' });
    const [isAddingNew, setIsAddingNew] = useState(false);
    const isClient = useIsClient();

    const fetchWeights = async () => {
        try {
            const res = await axios.get("http://localhost:5000/api/weights");
            setWeights(res.data);
        } catch (err) {
            console.error("Error fetching weights:", err);
        }
    };

    const updateWeight = async (jobId: string, processId: string, weight: number) => {
        try {
            await axios.post("http://localhost:5000/api/weights", {
                jobId,
                processId,
                weight
            });
            fetchWeights();
            alert("Weight updated successfully!");
        } catch (err) {
            console.error("Error updating weight:", err);
            alert("Error updating weight");
        }
    };

    const deleteWeight = async (jobId: string, processId: string) => {
        if (confirm("Are you sure you want to delete this weight entry?")) {
            try {
                await axios.delete(`http://localhost:5000/api/weights/${jobId}/${processId}`);
                fetchWeights();
                alert("Weight deleted successfully!");
            } catch (err) {
                console.error("Error deleting weight:", err);
                alert("Error deleting weight");
            }
        }
    };

    const addNewWeight = async () => {
        if (!newEntry.jobId || !newEntry.processId || !newEntry.weight) {
            alert("Please fill all fields");
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/weights", {
                jobId: newEntry.jobId,
                processId: newEntry.processId,
                weight: parseInt(newEntry.weight)
            });
            setNewEntry({ jobId: '', processId: '', weight: '' });
            setIsAddingNew(false);
            fetchWeights();
            alert("Weight added successfully!");
        } catch (err) {
            console.error("Error adding weight:", err);
            alert("Error adding weight");
        }
    };

    const startEdit = (jobId: string, processId: string, currentWeight: number) => {
        const key = `${jobId}-${processId}`;
        setIsEditing({ ...isEditing, [key]: true });
        setEditValues({ ...editValues, [key]: currentWeight });
    };

    const saveEdit = (jobId: string, processId: string) => {
        const key = `${jobId}-${processId}`;
        const newWeight = editValues[key];
        if (newWeight !== undefined) {
            updateWeight(jobId, processId, newWeight);
            setIsEditing({ ...isEditing, [key]: false });
        }
    };

    const cancelEdit = (jobId: string, processId: string) => {
        const key = `${jobId}-${processId}`;
        setIsEditing({ ...isEditing, [key]: false });
        const newEditValues = { ...editValues };
        delete newEditValues[key];
        setEditValues(newEditValues);
    };

    // Convert weights object to array for easier rendering
    const weightEntries: WeightEntry[] = [];
    Object.keys(weights).forEach(jobId => {
        Object.keys(weights[jobId]).forEach(processId => {
            weightEntries.push({
                jobId,
                processId,
                weight: weights[jobId][processId]
            });
        });
    });

    useEffect(() => {
        if (isClient) {
            fetchWeights();
            const interval = setInterval(fetchWeights, 5000); // refresh every 5 seconds
            return () => clearInterval(interval);
        }
    }, [isClient]);

    // Show loading state during hydration
    if (!isClient) {
        return (
            <div className="flex flex-col w-screen h-screen justify-center items-center bg-[#effbfc] border-8 border-[#153c49]">
                <div className="text-2xl text-[#153c49]">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-screen h-screen justify-start items-center pt-20 gap-10 bg-[#effbfc] border-8 border-[#153c49]">
            <div>
                <h2 className="flex gap-2 text-4xl text-[#153c49] font-semibold text-center">
                    <Settings size={38} /> Job-Process Weight Management
                </h2>
            </div>
            
            <div className="bg-gray-50 w-4/5 p-6 rounded-sm shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Weight Configuration</h3>
                    <Button 
                        onClick={() => setIsAddingNew(!isAddingNew)}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <Plus size={16} className="mr-2" />
                        Add New Weight
                    </Button>
                </div>

                {isAddingNew && (
                    <div className="bg-blue-50 p-4 rounded-md mb-4">
                        <h4 className="font-semibold mb-3">Add New Job-Process Weight</h4>
                        <div className="grid grid-cols-4 gap-4 items-end">
                            <div>
                                <Label>Job ID</Label>
                                <Input
                                    value={newEntry.jobId}
                                    onChange={(e) => setNewEntry({...newEntry, jobId: e.target.value})}
                                    placeholder="e.g., 45"
                                />
                            </div>
                            <div>
                                <Label>Process ID</Label>
                                <Input
                                    value={newEntry.processId}
                                    onChange={(e) => setNewEntry({...newEntry, processId: e.target.value})}
                                    placeholder="e.g., 1"
                                />
                            </div>
                            <div>
                                <Label>Weight (g)</Label>
                                <Input
                                    type="number"
                                    value={newEntry.weight}
                                    onChange={(e) => setNewEntry({...newEntry, weight: e.target.value})}
                                    placeholder="e.g., 42"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={addNewWeight} size="sm" className="bg-green-600 hover:bg-green-700">
                                    <Save size={16} className="mr-1" />
                                    Save
                                </Button>
                                <Button 
                                    onClick={() => {
                                        setIsAddingNew(false);
                                        setNewEntry({ jobId: '', processId: '', weight: '' });
                                    }} 
                                    variant="outline" 
                                    size="sm"
                                >
                                    <X size={16} className="mr-1" />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center py-4">Job ID</TableHead>
                            <TableHead className="text-center">Process ID</TableHead>
                            <TableHead className="text-center">Weight (grams)</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {weightEntries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                    No weight configurations found. Add a new entry to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            weightEntries.map((entry) => {
                                const key = `${entry.jobId}-${entry.processId}`;
                                const isCurrentlyEditing = isEditing[key];
                                
                                return (
                                    <TableRow key={key}>
                                        <TableCell className="text-center py-4 font-medium">
                                            {entry.jobId}
                                        </TableCell>
                                        <TableCell className="text-center py-4 font-medium">
                                            {entry.processId}
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            {isCurrentlyEditing ? (
                                                <Input
                                                    type="number"
                                                    value={editValues[key] || entry.weight}
                                                    onChange={(e) => setEditValues({
                                                        ...editValues,
                                                        [key]: parseInt(e.target.value) || 0
                                                    })}
                                                    className="w-20 mx-auto text-center"
                                                />
                                            ) : (
                                                <span className="font-semibold">{entry.weight}g</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center py-4">
                                            <div className="flex justify-center gap-2">
                                                {isCurrentlyEditing ? (
                                                    <>
                                                        <Button
                                                            onClick={() => saveEdit(entry.jobId, entry.processId)}
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                        >
                                                            <Save size={14} />
                                                        </Button>
                                                        <Button
                                                            onClick={() => cancelEdit(entry.jobId, entry.processId)}
                                                            variant="outline"
                                                            size="sm"
                                                        >
                                                            <X size={14} />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            onClick={() => startEdit(entry.jobId, entry.processId, entry.weight)}
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            <Edit size={14} />
                                                        </Button>
                                                        <Button
                                                            onClick={() => deleteWeight(entry.jobId, entry.processId)}
                                                            size="sm"
                                                            variant="destructive"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
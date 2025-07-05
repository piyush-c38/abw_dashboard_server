"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner"
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { useEffect } from "react";


const FormSchema = z.object({
    ssid: z.string().min(2, {
        message: "Field cannot be empty",
    }),
    password: z.string().min(2, {
        message: "Field cannot be empty",
    }),
})

export default function WifiCredential() {
    const router = useRouter();
    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            ssid: "",
            password: "",
        },
    })
    function onSubmit(data: z.infer<typeof FormSchema>) {
        alert("Submitted: " + JSON.stringify(data));
    }

    useEffect(() => {
        
    },[]);
    return (
        <div
            className="w-screen h-screen flex justify-center items-center relative"
            style={{
                backgroundImage: "url('blue_wall_bg.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="absolute inset-0 bg-black/20 z-0" />
            <div className="w-3/4 h-3/4 bg-gray-50 z-10 rounded-2xl flex flex-col justify-center items-center gap-24">
                <div className="flex flex-col items-center">
                    <Form {...form} >
                        <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
                            <FormField
                                control={form.control}
                                name="ssid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SSID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter SSID" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter Password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Submit</Button>
                        </form>
                    </Form>
                </div>

            </div>
        </div>
    );
}
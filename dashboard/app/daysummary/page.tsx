"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  dob: z.date({
    required_error: "Date is required",
  }),
});

export default function DaySummary() {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const dateStr = format(data.dob, "yyyy-MM-dd");
    router.push(`/daysummary/result?date=${dateStr}`);
  }

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
      <div className="w-3/4 h-3/4 bg-gray-50 z-10 rounded-2xl flex flex-col justify-center gap-24">
        <div className="flex justify-center w-full">
          <div className="w-auto flex flex-col md:flex-row justify-center items-center gap-10 p-3">
            <Image
              src="/logo_506.png"
              alt="Logo_506"
              width={160}
              height={160}
            />
            <div className="text-2xl md:text-4xl font-semibold text-[#153c49] text-shadow-[#153c49] text-center">
              506 Army Base Workshop
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex flex-wrap gap-10 justify-center">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex justify-center items-center gap-2 flex-wrap">
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-lg">Select Date to know the Summary</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            captionLayout="dropdown"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="bg-[#1b4e5f] text-white hover:bg-[#0d2933]">Submit</Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
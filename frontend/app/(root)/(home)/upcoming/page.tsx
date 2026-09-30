import { CallList } from "@/components/call-list";

const UpcomingPage = () => {
  return (
    <section className="mx-auto flex size-full max-w-[1180px] flex-col gap-8 px-6 py-8 text-[#111827]">
      <h1 className="text-3xl font-bold">Upcoming Meetings</h1>

      <CallList type="upcoming" />
    </section>
  );
};

export default UpcomingPage;

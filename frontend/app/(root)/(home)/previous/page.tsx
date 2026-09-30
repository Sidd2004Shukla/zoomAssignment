import { CallList } from "@/components/call-list";

const PreviousPage = () => {
  return (
    <section className="mx-auto flex size-full max-w-[1180px] flex-col gap-8 px-6 py-8 text-[#111827]">
      <h1 className="text-3xl font-bold">Previous Meetings</h1>

      <CallList type="ended" />
    </section>
  );
};

export default PreviousPage;

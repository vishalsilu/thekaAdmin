import Topbar from "../components/layout/Topbar";

const Placeholder = ({ title }) => {
  return (
    <>
      <Topbar variant="dashboard" />
      <section className="mt-10 border border-stone-200 bg-white p-8">
        <h1 className="mb-2 text-3xl font-bold">{title}</h1>
        <p className="text-stone-500">This section is coming soon.</p>
      </section>
    </>
  );
};

export default Placeholder;

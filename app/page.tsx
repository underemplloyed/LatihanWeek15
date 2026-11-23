import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Suspense } from "react";

async function createTask(formData: FormData) {
  "use server";
  const title = String(formData.get("title") || "").trim();
  const course = String(formData.get("course") || "").trim();
  if (!title || !course) return;
  await prisma.task.create({ data: { title, course } });
  revalidatePath("/");
}

async function updateTask(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const title = String(formData.get("title") || "").trim();
  const course = String(formData.get("course") || "").trim();
  if (!id || !title || !course) return;
  await prisma.task.update({ where: { id }, data: { title, course } });
  revalidatePath("/");
}

async function deleteTask(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  if (!id) return;
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
}

async function TaskList() {
  let tasks: { id: number; title: string; course: string }[] = [];
  try {
    tasks = await prisma.task.findMany({ orderBy: { id: "desc" } });
  } catch {
    tasks = [];
  }

  if (tasks.length === 0) {
    return <p className="text-gray-500 text-sm">Belum ada data.</p>;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="border rounded p-3 flex flex-col sm:flex-row gap-2 items-center justify-between"
        >
          <form
            action={updateTask}
            className="flex flex-col sm:flex-row gap-2 flex-1 w-full"
          >
            <input type="hidden" name="id" value={task.id} />
            <input
              name="title"
              defaultValue={task.title}
              required
              className="border rounded px-2 py-1 flex-1"
            />
            <input
              name="course"
              defaultValue={task.course}
              required
              className="border rounded px-2 py-1 flex-1"
            />
            <button
              type="submit"
              className="bg-amber-500 text-white px-3 py-1 rounded text-sm hover:bg-amber-600"
            >
              Update
            </button>
          </form>

          <form action={deleteTask}>
            <input type="hidden" name="id" value={task.id} />
            <button
              type="submit"
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Delete
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Praktikum 15 - CRUD Daftar Tugas</h1>

      <section className="border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold text-lg">Create Data</h2>
        <form action={createTask} className="flex flex-col sm:flex-row gap-2">
          <input
            name="title"
            placeholder="Nama Tugas"
            required
            className="border rounded px-3 py-2 flex-1"
          />
          <input
            name="course"
            placeholder="Mata Kuliah"
            required
            className="border rounded px-3 py-2 flex-1"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700"
          >
            Create
          </button>
        </form>
      </section>

      <section className="border rounded-lg p-4 space-y-3">
        <h2 className="font-semibold text-lg">Review, Update & Delete Data</h2>
        <Suspense fallback={<p className="text-sm text-gray-500">Memuat data...</p>}>
          <TaskList />
        </Suspense>
      </section>
    </main>
  );
}
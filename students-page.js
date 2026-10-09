import {
  startAdmin, db, collection, getDocs, money, escapeHTML, showError
} from "./admin.js";

await startAdmin();

const $ = id => document.getElementById(id);
let students = [];

async function load() {
  try {
    const [studentSnapshot, walletSnapshot] = await Promise.all([
      getDocs(collection(db, "students")),
      getDocs(collection(db, "wallets"))
    ]);

    const wallets = new Map(
      walletSnapshot.docs.map(item => [item.id, item.data()])
    );

    students = studentSnapshot.docs.map(item => {
      const data = item.data();
      const wallet = wallets.get(item.id) || {};

      return {
        uid: item.id,
        ...data,
        balance: Number(wallet.balance ?? wallet.amount ?? 0)
      };
    });

    render();
  } catch (error) {
    showError(error, "تعذر تحميل الطلاب");
  }
}

function render() {
  const term = $("search").value.trim().toLowerCase();

  const filtered = students.filter(student =>
    `${student.name || ""} ${student.fullName || ""} ${student.displayName || ""} ${student.email || ""} ${student.studentCode || ""} ${student.code || ""} ${student.uid}`
      .toLowerCase().includes(term)
  );

  $("rows").innerHTML = filtered.length
    ? filtered.map(student => `
      <tr>
        <td>${escapeHTML(student.name || student.fullName || student.displayName || "—")}</td>
        <td>${escapeHTML(student.email || "—")}</td>
        <td>${escapeHTML(student.studentCode || student.code || "—")}</td>
        <td>${escapeHTML(student.uid)}</td>
        <td>${money(student.balance)}</td>
      </tr>
    `).join("")
    : '<tr><td colspan="5" class="empty">لا توجد نتائج.</td></tr>';
}

$("search").oninput = render;
$("refreshBtn").onclick = load;

await load();

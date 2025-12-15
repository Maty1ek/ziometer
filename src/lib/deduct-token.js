export const deductToken = async (user, fetchTokens) => {
  if (!user) return;

  const res = await fetch("/api/tokens/deduct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: user.id,
      amount: 1, // how many tokens to deduct
    }),
  });

  const data = await res.json();

  fetchTokens(true)

  if (data.success) {
    return 'success'
  } else {
    return `Token deduction error: ${data.error}`;
  }
};

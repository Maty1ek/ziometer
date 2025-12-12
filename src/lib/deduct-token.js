export const deductToken = async (user, setTokens) => {
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

  if (data.success) {
    setTokens((prev) => prev - 1)
  } else {
    return `Token deduction error: ${data.error}`;
  }
};

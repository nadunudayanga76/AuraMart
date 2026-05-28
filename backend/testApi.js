async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/orders/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: 'INV-E3OI0Q',
        email: 'nadunudayanga76@gmail.com'
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || res.statusText);
    console.log("SUCCESS:", data);
  } catch (err) {
    console.error("ERROR:", err.message);
  }
}
test();

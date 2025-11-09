// components/BuyModal.jsx
'use client';
import { createWhopCheckout } from '@/app/actions/createWhopCheckout';

export default function BuyModal({ user, onClose }) {
  const handleBuy = async (plan, price) => { 
    try {
        console.log(user.email, plan,'yoohooo');
      const url = await createWhopCheckout(plan, price, user.email);
      
      window.location.href = url; // Full redirect to Whop
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Checkout failed – try again');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-[20px] z-50">
      <div className="bg-white rounded-[15px] max-w-[500px] w-full p-[20px] space-y-[15px] text-[#414141]">
        <h2 className="font-bold text-[24px] text-center">Choose a Token Pack</h2>
        {[
          { plan: 'starter', price: '$4.99', tokens: 5, desc: 'Perfect for your first analysis' },
          { plan: 'explorer', price: '$9.99', tokens: 15, desc: 'Save 25% – most popular' },
          { plan: 'deep-dive', price: '$16.99', tokens: 30, desc: 'Best value – never run out' },
        ].map((p) => (
          <button
            key={p.plan}
            onClick={() => handleBuy(p.plan, p.price)}
            className="w-full p-[10px] bg-[#fafafa] rounded-[10px] text-left hover:bg-gray-100 transition"
          >
            <div className="font-bold text-[18px]">{p.price} – {p.tokens} tokens</div>
            <div className="text-[15px]">{p.desc}</div>
          </button>
        ))}
        <button onClick={onClose} className="w-full text-[#414141] text-[15px] underline">Cancel</button>
      </div>
    </div>
  );
}
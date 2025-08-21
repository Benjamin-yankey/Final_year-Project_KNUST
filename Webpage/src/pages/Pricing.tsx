const Pricing = () => (
  <div className="p-8 max-w-5xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">Pricing</h1>
    <div className="grid md:grid-cols-3 gap-6">
      <div className="border rounded-lg p-6"><h2 className="font-semibold mb-2">Starter</h2><p className="text-muted-foreground mb-2">For small fields</p><div className="text-2xl font-bold">Free</div></div>
      <div className="border rounded-lg p-6"><h2 className="font-semibold mb-2">Pro</h2><p className="text-muted-foreground mb-2">For growing teams</p><div className="text-2xl font-bold">$19/mo</div></div>
      <div className="border rounded-lg p-6"><h2 className="font-semibold mb-2">Enterprise</h2><p className="text-muted-foreground mb-2">Custom solutions</p><div className="text-2xl font-bold">Contact us</div></div>
    </div>
  </div>
);

export default Pricing;
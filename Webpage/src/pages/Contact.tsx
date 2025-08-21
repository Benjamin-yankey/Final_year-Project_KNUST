const Contact = () => (
  <div className="p-8 max-w-3xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
    <p className="text-muted-foreground mb-4">
      Reach our team at support@weedwise.example
    </p>
    <form className="space-y-4">
      <input className="border rounded w-full p-2" placeholder="Your name" />
      <input className="border rounded w-full p-2" placeholder="Email" />
      <textarea
        className="border rounded w-full p-2"
        rows={5}
        placeholder="Message"
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Send
      </button>
    </form>
  </div>
);

export default Contact;

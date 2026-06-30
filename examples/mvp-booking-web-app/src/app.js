const form = document.querySelector("#booking-form");
const list = document.querySelector("#booking-list");
const empty = document.querySelector("#empty-state");

const bookings = [];

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  bookings.push({
    name: data.get("name"),
    phone: data.get("phone"),
    service: data.get("service"),
    date: data.get("date"),
    time: data.get("time"),
  });
  form.reset();
  renderBookings();
});

function renderBookings() {
  list.innerHTML = "";
  empty.hidden = bookings.length > 0;
  for (const booking of bookings) {
    const item = document.createElement("li");
    item.textContent = `${booking.name} booked ${booking.service} on ${booking.date} at ${booking.time}. Phone: ${booking.phone}`;
    list.appendChild(item);
  }
}

renderBookings();

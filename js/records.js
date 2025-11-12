function getRecords() {
  fetch("http://wd.etsisi.upm.es:10000/records")
    .then((res) => {
      if (!res.ok) throw new Error("Error in the request: " + res.status);
      return res.json();
    })
    .then((data) => {
      printRecords(data);
    })
    .catch((err) => {
      console.error("Error fetching records:", err);
      document.getElementById("res").innerHTML = `
        <div class="alert alert-danger text-center mt-3">
          Could not load records.<br>${err.message}
        </div>`;
    });
}

function printRecords(data) {
  if (!data || data.length === 0) {
    document.getElementById("res").innerHTML = `
      <div class="alert alert-warning text-center">
        No records available.
      </div>`;
    return;
  }

  let alldata = `
    <table class="table table-dark table-hover table-bordered align-middle text-center mb-0">
      <thead class="table-primary">
        <tr>
          <th>Nick</th>
          <th>Score</th>
          <th>UFOs</th>
          <th>Selected Time(s)</th>
          <th>Record Date</th>
        </tr>
      </thead>
      <tbody>
  `;

  data.forEach((record) => {
    const date = new Date(record.recordDate);
    alldata += `
      <tr>
        <td>${record.username}</td>
        <td>${record.punctuation}</td>
        <td>${record.ufos}</td>
        <td>${record.disposedTime}</td>
        <td>${date.toLocaleString()}</td>
      </tr>`;
  });

  alldata += `</tbody></table>`;
  document.getElementById("res").innerHTML = alldata;
}

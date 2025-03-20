$(document).ready(function () {
  $("#loadingContainer").html("").addClass("!hidden");

  $("#ticketsTable").DataTable();
  $(".btn-view").each(function () {
    $(this).click(function () {
      const ticketId = $(this).data("id");
      window.open(`/admin/tickets/${ticketId}`, "_blank");
    });
  });
});

const createReportMessage = (report_id: number, report_reason: number) => {
	return `
	<!DOCTYPE html>
	<html lang="en">
	<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">
	</head>
	<body>
	<section class="section">
	<h1 class="title is-1">User reported another user</h1>
	<p class="block">Please, review report_id ${report_id} with report_reason ${report_reason}</p>
	
	<p class="block has-text-weight-bold">Best regards,</p>
	<p class="block has-text-weight-bold">42 Bot</p>
	</section>
	</body>
	</html>`;
};

export default createReportMessage;

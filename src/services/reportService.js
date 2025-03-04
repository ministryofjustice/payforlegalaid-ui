/**
 * Returns a list of dummy reports.
 * When the real API is available, replace this with an axios call.
 */
export async function getReports() {
    return {
        reportList: [
            {
                id: '3fa85f64-5717-4562-b3fc-2c963f007e86',
                reportName: 'Pay Run Total Amount Report',
                description: 'Includes data on previous payment runs, an estimate of current pay run projection, number of payments made.',
            },
            {
                id: 'b1a85f64-5717-4562-b3fc-2c963f007abc',
                reportName: 'Provider Remittances Report',
                description: 'Includes data on previous payment to provider, provider account details, account balance.',
            },
            {
                id: 'c2a85f64-5717-4562-b3fc-2c963f007def',
                reportName: 'CCMS and CIS bank account report with category code',
                description: 'Summary of cash payments and cash receipts from CIS and CCMS.'
            },
            {
                id: 'd3b96g75-5717-4562-b3fc-2c963f007ghi',
                reportName: 'All invoices',
                description: 'All invoice payments from CCMS used for "over 25k" invoice publication',
            }
        ]
    }
}
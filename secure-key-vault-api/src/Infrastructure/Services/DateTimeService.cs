using security_file_share_api.Application.Common.Interfaces;
using System;

namespace security_file_share_api.Infrastructure.Services
{
    public class DateTimeService : IDateTime
    {
        public DateTime Now => DateTime.Now;
    }
}

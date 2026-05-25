using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace security_file_share_api.Application.Common.Exceptions
{
    public class UnsupportedMediaTypeException : Exception
    {
        public UnsupportedMediaTypeException()
            :base()
        {

        }

        public UnsupportedMediaTypeException(string message)
            : base(message)
        {

        }

        public UnsupportedMediaTypeException(string message, Exception innerException)
            : base(message, innerException)
        {

        }

        //public UnsupportedMediaTypeException(string name, string fileType)
        //    : base($"File : \"{name}\"  doesn't have the suported type ({fileType}).")
        //{

        //}
    }
}

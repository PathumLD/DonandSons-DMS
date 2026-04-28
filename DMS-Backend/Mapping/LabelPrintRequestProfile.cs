using AutoMapper;
using DMS_Backend.Models.DTOs.LabelPrintRequests;
using DMS_Backend.Models.Entities;

namespace DMS_Backend.Mapping;

public sealed class LabelPrintRequestProfile : Profile
{
    public LabelPrintRequestProfile()
    {
        CreateMap<LabelPrintRequest, LabelPrintRequestListDto>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product!.Name))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<LabelPrintRequest, LabelPrintRequestDetailDto>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product!.Name))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.ApprovedByName, opt => opt.MapFrom(src => src.ApprovedBy != null ? $"{src.ApprovedBy.FirstName} {src.ApprovedBy.LastName}" : null));

        CreateMap<CreateLabelPrintRequestDto, LabelPrintRequest>();
        CreateMap<UpdateLabelPrintRequestDto, LabelPrintRequest>();
    }
}

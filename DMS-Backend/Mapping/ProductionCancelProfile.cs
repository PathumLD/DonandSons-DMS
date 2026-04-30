using AutoMapper;
using DMS_Backend.Models.DTOs.ProductionCancels;
using DMS_Backend.Models.Entities;

namespace DMS_Backend.Mapping;

public sealed class ProductionCancelProfile : Profile
{
    public ProductionCancelProfile()
    {
        CreateMap<ProductionCancel, ProductionCancelListDto>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product!.Name))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedBy != null ? $"{src.CreatedBy.FirstName} {src.CreatedBy.LastName}" : null))
            .ForMember(dest => dest.ApprovedByName, opt => opt.MapFrom(src => src.ApprovedBy != null ? $"{src.ApprovedBy.FirstName} {src.ApprovedBy.LastName}" : null));

        CreateMap<ProductionCancel, ProductionCancelDetailDto>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product!.Name))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedBy != null ? $"{src.CreatedBy.FirstName} {src.CreatedBy.LastName}" : null))
            .ForMember(dest => dest.ApprovedByName, opt => opt.MapFrom(src => src.ApprovedBy != null ? $"{src.ApprovedBy.FirstName} {src.ApprovedBy.LastName}" : null));

        CreateMap<CreateProductionCancelDto, ProductionCancel>();
        CreateMap<UpdateProductionCancelDto, ProductionCancel>();
    }
}

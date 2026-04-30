using AutoMapper;
using DMS_Backend.Models.DTOs.StockAdjustments;
using DMS_Backend.Models.Entities;

namespace DMS_Backend.Mapping;

public sealed class StockAdjustmentProfile : Profile
{
    public StockAdjustmentProfile()
    {
        CreateMap<StockAdjustment, StockAdjustmentListDto>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product!.Name))
            .ForMember(dest => dest.AdjustmentType, opt => opt.MapFrom(src => src.AdjustmentType.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedBy != null ? $"{src.CreatedBy.FirstName} {src.CreatedBy.LastName}" : null))
            .ForMember(dest => dest.ApprovedByName, opt => opt.MapFrom(src => src.ApprovedBy != null ? $"{src.ApprovedBy.FirstName} {src.ApprovedBy.LastName}" : null));

        CreateMap<StockAdjustment, StockAdjustmentDetailDto>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product!.Name))
            .ForMember(dest => dest.AdjustmentType, opt => opt.MapFrom(src => src.AdjustmentType.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.CreatedByName, opt => opt.MapFrom(src => src.CreatedBy != null ? $"{src.CreatedBy.FirstName} {src.CreatedBy.LastName}" : null))
            .ForMember(dest => dest.ApprovedByName, opt => opt.MapFrom(src => src.ApprovedBy != null ? $"{src.ApprovedBy.FirstName} {src.ApprovedBy.LastName}" : null));

        CreateMap<CreateStockAdjustmentDto, StockAdjustment>();
        CreateMap<UpdateStockAdjustmentDto, StockAdjustment>();
    }
}

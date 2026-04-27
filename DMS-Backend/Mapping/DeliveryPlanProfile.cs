using AutoMapper;
using DMS_Backend.Models.DTOs.DeliveryPlans;
using DMS_Backend.Models.Entities;

namespace DMS_Backend.Mapping;

public sealed class DeliveryPlanProfile : Profile
{
    public DeliveryPlanProfile()
    {
        CreateMap<DeliveryPlan, DeliveryPlanListDto>()
            .ForMember(dest => dest.DeliveryTurnName, opt => opt.MapFrom(src => src.DeliveryTurn!.Name))
            .ForMember(dest => dest.DayTypeName, opt => opt.MapFrom(src => src.DayType!.Name))
            .ForMember(dest => dest.TotalItems, opt => opt.MapFrom(src => src.DeliveryPlanItems.Count));

        CreateMap<DeliveryPlan, DeliveryPlanDetailDto>()
            .ForMember(dest => dest.DeliveryTurnName, opt => opt.MapFrom(src => src.DeliveryTurn!.Name))
            .ForMember(dest => dest.DayTypeName, opt => opt.MapFrom(src => src.DayType!.Name))
            .ForMember(dest => dest.Items, opt => opt.MapFrom(src => src.DeliveryPlanItems));

        CreateMap<DeliveryPlanItem, DeliveryPlanItemDto>()
            .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product!.Name))
            .ForMember(dest => dest.OutletName, opt => opt.MapFrom(src => src.Outlet!.Name));

        CreateMap<CreateDeliveryPlanDto, DeliveryPlan>();
        CreateMap<UpdateDeliveryPlanDto, DeliveryPlan>();
        CreateMap<BulkUpsertDeliveryPlanItemDto, DeliveryPlanItem>();
    }
}

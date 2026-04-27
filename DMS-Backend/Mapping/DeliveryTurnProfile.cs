using AutoMapper;
using DMS_Backend.Models.DTOs.DeliveryTurns;
using DMS_Backend.Models.Entities;

namespace DMS_Backend.Mapping;

public sealed class DeliveryTurnProfile : Profile
{
    public DeliveryTurnProfile()
    {
        CreateMap<DeliveryTurn, DeliveryTurnListDto>();
        CreateMap<DeliveryTurn, DeliveryTurnDetailDto>();
        CreateMap<CreateDeliveryTurnDto, DeliveryTurn>();
        CreateMap<UpdateDeliveryTurnDto, DeliveryTurn>();
    }
}

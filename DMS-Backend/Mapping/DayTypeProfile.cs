using AutoMapper;
using DMS_Backend.Models.DTOs.DayTypes;
using DMS_Backend.Models.Entities;

namespace DMS_Backend.Mapping;

public sealed class DayTypeProfile : Profile
{
    public DayTypeProfile()
    {
        CreateMap<DayType, DayTypeListDto>();
        CreateMap<DayType, DayTypeDetailDto>();
        CreateMap<CreateDayTypeDto, DayType>();
        CreateMap<UpdateDayTypeDto, DayType>();
    }
}

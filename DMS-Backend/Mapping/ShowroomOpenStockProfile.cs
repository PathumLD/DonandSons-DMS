using AutoMapper;
using DMS_Backend.Models.DTOs.ShowroomOpenStock;
using DMS_Backend.Models.Entities;

namespace DMS_Backend.Mapping;

public sealed class ShowroomOpenStockProfile : Profile
{
    public ShowroomOpenStockProfile()
    {
        CreateMap<ShowroomOpenStock, ShowroomOpenStockListDto>()
            .ForMember(dest => dest.OutletName, opt => opt.MapFrom(src => src.Outlet!.Name));

        CreateMap<ShowroomOpenStock, ShowroomOpenStockDetailDto>()
            .ForMember(dest => dest.OutletName, opt => opt.MapFrom(src => src.Outlet!.Name));

        CreateMap<CreateShowroomOpenStockDto, ShowroomOpenStock>();
        CreateMap<UpdateShowroomOpenStockDto, ShowroomOpenStock>();
    }
}

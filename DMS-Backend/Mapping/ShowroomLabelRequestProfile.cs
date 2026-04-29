using AutoMapper;
using DMS_Backend.Models.DTOs.ShowroomLabelRequest;
using DMS_Backend.Models.Entities;

namespace DMS_Backend.Mapping;

public sealed class ShowroomLabelRequestProfile : Profile
{
    public ShowroomLabelRequestProfile()
    {
        CreateMap<ShowroomLabelRequest, ShowroomLabelRequestListDto>()
            .ForMember(dest => dest.OutletCode, opt => opt.MapFrom(src => src.Outlet!.Code))
            .ForMember(dest => dest.OutletName, opt => opt.MapFrom(src => src.Outlet!.Name));

        CreateMap<ShowroomLabelRequest, ShowroomLabelRequestDetailDto>()
            .ForMember(dest => dest.OutletCode, opt => opt.MapFrom(src => src.Outlet!.Code))
            .ForMember(dest => dest.OutletName, opt => opt.MapFrom(src => src.Outlet!.Name));

        CreateMap<CreateShowroomLabelRequestDto, ShowroomLabelRequest>();
    }
}
